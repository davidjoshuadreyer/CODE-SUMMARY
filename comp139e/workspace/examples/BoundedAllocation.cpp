// Only linked into TestBadAllocExceptionDemo. Its original loop attempts ~28 GB.
// Preserve the demonstration's catch(bad_alloc&) without exhausting this computer.
#include <cstddef>
#include <cstdlib>
#include <iostream>
#include <new>

void* operator new[](std::size_t bytes)
{
    if (bytes > 1024 * 1024)
    {
        std::cout << "Teaching allocation limit: arrays larger than 1 MiB throw bad_alloc.\n";
        throw std::bad_alloc();
    }
    void* memory = std::malloc(bytes == 0 ? 1 : bytes);
    if (!memory) throw std::bad_alloc();
    return memory;
}
void operator delete[](void* memory) noexcept { std::free(memory); }
void operator delete[](void* memory, std::size_t) noexcept { std::free(memory); }
